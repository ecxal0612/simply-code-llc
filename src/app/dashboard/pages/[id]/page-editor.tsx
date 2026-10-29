"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  ExternalLink,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { BlogPostsSectionSettings } from "~/app/dashboard/pages/blog-posts-section-settings";
import { commitAllRichTextPendingUploads } from "~/components/editor/rich-text-pending";
import { RichTextEditor } from "~/components/editor/rich-text-editor";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  resolveContactFormContent,
  type ContactFormContent,
} from "~/lib/contact/form-content";
import type {
  PageSectionContent,
  PageSectionImage,
  PageSectionItem,
  PageStatus,
} from "~/lib/pages/types";
import { useUploadThing } from "~/lib/uploadthing";

export type EditableSection = {
  id: string;
  key: string;
  label: string;
  kind: string;
  content: PageSectionContent;
};

export type EditablePage = {
  id: string;
  title: string;
  slug: string;
  path: string;
  status: PageStatus;
  isSystem: boolean;
  body: string | null;
  sections: EditableSection[];
};

export type TeamMemberOption = {
  id: string;
  name: string;
  role: string | null;
};

export type ProjectOption = {
  id: string;
  title: string;
  label: string | null;
};

function cloneContent(content: PageSectionContent): PageSectionContent {
  return {
    ...content,
    items: content.items?.map((item) => ({ ...item })),
    images: content.images?.map((image) => ({ ...image })),
    contactForm: content.contactForm
      ? {
          ...content.contactForm,
          projectTypeOptions: content.contactForm.projectTypeOptions
            ? [...content.contactForm.projectTypeOptions]
            : undefined,
          budgetOptions: content.contactForm.budgetOptions
            ? [...content.contactForm.budgetOptions]
            : undefined,
        }
      : undefined,
  };
}

async function readError(res: Response, fallback: string) {
  const body = (await res.json().catch(() => null)) as {
    error?: string;
  } | null;
  return body?.error ?? fallback;
}

type ItemsMode = "none" | "list" | "single" | "team" | "projects";

type SectionFields = {
  eyebrow: boolean;
  title: boolean;
  body: boolean;
  cta: boolean;
  secondaryCta: boolean;
  contactForm: boolean;
  blogPostsPerPage: boolean;
  items: ItemsMode;
  images: boolean;
};

const defaultSectionFields: SectionFields = {
  eyebrow: true,
  title: true,
  body: true,
  cta: true,
  secondaryCta: true,
  contactForm: false,
  blogPostsPerPage: false,
  items: "list",
  images: true,
};

const sectionFieldOverrides: Record<string, Partial<SectionFields>> = {
  hero: { items: "none" },
  "home-hero": { items: "none" },
  "home-experience": { items: "none" },
  "home-contact": { items: "none", images: false },
  "about-who": { cta: false, secondaryCta: false },
  "about-team": { items: "team", cta: false, secondaryCta: false },
  "about-why": { cta: false, secondaryCta: false },
  "services-intro": { cta: false, secondaryCta: false },
  "services-features": { cta: false, secondaryCta: false },
  "work-experience": { items: "none", cta: false, secondaryCta: false },
  "home-projects": { items: "projects" },
  "work-projects": { items: "projects", cta: false, secondaryCta: false },
  testimonials: { cta: false, secondaryCta: false },
  "blog-posts": {
    items: "none",
    cta: false,
    secondaryCta: false,
    blogPostsPerPage: true,
  },
  "contact-intro": {
    cta: false,
    secondaryCta: false,
    contactForm: true,
  },
  "policy-hero": { items: "none", cta: false, secondaryCta: false },
  policy: {
    eyebrow: false,
    items: "none",
    cta: false,
    secondaryCta: false,
    images: false,
  },
  cta: { items: "none" },
  rich: { items: "none", cta: false, secondaryCta: false },
};

function getSectionFields(kind: string): SectionFields {
  return { ...defaultSectionFields, ...sectionFieldOverrides[kind] };
}

function SectionImageUploader({
  image,
  existingUrl,
  pendingFile,
  onSelectFile,
  onClearPending,
}: {
  image: PageSectionImage;
  existingUrl?: string;
  pendingFile?: File;
  onSelectFile: (file: File) => void;
  onClearPending: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : existingUrl),
    [pendingFile, existingUrl],
  );

  useEffect(() => {
    if (!pendingFile || !previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [pendingFile, previewUrl]);

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="bg-muted relative aspect-[16/9]">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={image.alt ?? image.label ?? ""}
            fill
            className="object-cover"
            sizes="360px"
            unoptimized={Boolean(pendingFile)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImagePlus className="text-muted-foreground size-6" />
          </div>
        )}
      </div>
      <div className="space-y-2 p-3">
        <p className="text-sm font-medium">{image.label ?? image.slot}</p>
        <p className="text-muted-foreground font-mono text-[11px]">
          {image.slot}
        </p>
        {pendingFile ? (
          <p className="text-xs text-amber-600">
            {pendingFile.name} — uploaded when you save.
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="mr-2 size-4" />
            {pendingFile ? "Choose another" : "Replace image"}
          </Button>
          {pendingFile ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClearPending}
              aria-label="Cancel pending upload"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelectFile(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function ItemsEditor({
  items,
  onChange,
}: {
  items: PageSectionItem[];
  onChange: (items: PageSectionItem[]) => void;
}) {
  function updateItem(
    index: number,
    field: keyof PageSectionItem,
    value: string,
  ) {
    const next = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Items</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, { title: "", description: "" }])}
        >
          <Plus className="mr-1.5 size-3.5" />
          Add item
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          No items in this section yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium">
                  Item {index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive size-7"
                  onClick={() =>
                    onChange(
                      items.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  aria-label="Remove item"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              <Input
                value={item.title ?? ""}
                onChange={(event) =>
                  updateItem(index, "title", event.target.value)
                }
                placeholder="Title / name"
              />
              <Input
                value={item.meta ?? ""}
                onChange={(event) =>
                  updateItem(index, "meta", event.target.value)
                }
                placeholder="Label, role, date, or step"
              />
              <textarea
                value={item.description ?? ""}
                onChange={(event) =>
                  updateItem(index, "description", event.target.value)
                }
                placeholder="Description / quote"
                rows={3}
                className="border-input focus-visible:ring-ring w-full border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsPickerEditor({
  items,
  projects,
  onChange,
}: {
  items: PageSectionItem[];
  projects: ProjectOption[];
  onChange: (items: PageSectionItem[]) => void;
}) {
  const selectedIds = new Set(
    items.map((item) => item.projectId).filter(Boolean),
  );
  const allSelected =
    projects.length > 0 &&
    projects.every((project) => selectedIds.has(project.id));

  function addProject() {
    const firstAvailable = projects.find(
      (project) => !selectedIds.has(project.id),
    );
    if (!firstAvailable) return;
    onChange([...items, { projectId: firstAvailable.id }]);
  }

  function updateProject(index: number, projectId: string) {
    const next = items
      .map((item, itemIndex) =>
        itemIndex === index ? { projectId: projectId || undefined } : item,
      )
      .filter((item) => item.projectId);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label>Projects</Label>
          <p className="text-muted-foreground mt-1 text-xs">
            Select portfolio projects from the{" "}
            <Link href="/dashboard/projects" className="text-primary underline">
              Projects dashboard
            </Link>
            . Title, image, description, label, date, and links come from each
            project record.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProject}
          disabled={projects.length === 0 || allSelected}
          className="shrink-0"
        >
          <Plus className="mr-1.5 size-3.5" />
          Add project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-md border border-dashed p-4">
          <p className="text-sm font-medium">No projects yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Create projects first, then return here to feature them on this
            page.
          </p>
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          No projects selected for this section yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap items-end gap-2 rounded-md border p-3"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor={`section-project-${index}`}>
                  Project {index + 1}
                </Label>
                <select
                  id={`section-project-${index}`}
                  value={item.projectId ?? ""}
                  onChange={(event) =>
                    updateProject(index, event.target.value)
                  }
                  className="border-input focus-visible:ring-ring picker-select flex h-9 w-full border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => {
                    const unavailable =
                      selectedIds.has(project.id) &&
                      project.id !== item.projectId;
                    return (
                      <option
                        key={project.id}
                        value={project.id}
                        disabled={unavailable}
                        className={unavailable ? "picker-select-option-unavailable" : undefined}
                      >
                        {project.title}
                        {project.label ? ` — ${project.label}` : ""}
                        {unavailable ? " (already selected)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive size-9"
                onClick={() =>
                  onChange(items.filter((_, itemIndex) => itemIndex !== index))
                }
                aria-label="Remove selected project"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamMembersEditor({
  items,
  members,
  onChange,
}: {
  items: PageSectionItem[];
  members: TeamMemberOption[];
  onChange: (items: PageSectionItem[]) => void;
}) {
  const selectedIds = new Set(
    items.map((item) => item.memberId).filter(Boolean),
  );
  const allSelected =
    members.length > 0 && members.every((member) => selectedIds.has(member.id));

  function addMember() {
    const firstAvailable = members.find(
      (member) => !selectedIds.has(member.id),
    );
    if (!firstAvailable) return;
    onChange([...items, { memberId: firstAvailable.id }]);
  }

  function updateMember(index: number, memberId: string) {
    const next = items
      .map((item, itemIndex) =>
        itemIndex === index ? { memberId: memberId || undefined } : item,
      )
      .filter((item) => item.memberId);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label>Team members</Label>
          <p className="text-muted-foreground mt-1 text-xs">
            Select which Team members appear in this section. Edit their photos,
            roles, and biographies in the Team dashboard.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMember}
          disabled={members.length === 0 || allSelected}
          className="shrink-0"
        >
          <Plus className="mr-1.5 size-3.5" />
          Add member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-md border border-dashed p-4">
          <p className="text-sm font-medium">No team members yet</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Create members in the{" "}
            <Link href="/dashboard/team" className="text-primary underline">
              Team dashboard
            </Link>{" "}
            first, then return here to select them.
          </p>
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          No members selected for this section yet.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap items-end gap-2 rounded-md border p-3"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor={`team-member-${index}`}>
                  Member {index + 1}
                </Label>
                <select
                  id={`team-member-${index}`}
                  value={item.memberId ?? ""}
                  onChange={(event) => updateMember(index, event.target.value)}
                  className="border-input focus-visible:ring-ring picker-select flex h-9 w-full border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="">Select a team member</option>
                  {members.map((member) => {
                    const unavailable =
                      selectedIds.has(member.id) &&
                      member.id !== item.memberId;
                    return (
                      <option
                        key={member.id}
                        value={member.id}
                        disabled={unavailable}
                        className={
                          unavailable ? "picker-select-option-unavailable" : undefined
                        }
                      >
                        {member.name}
                        {member.role ? ` — ${member.role}` : ""}
                        {unavailable ? " (already selected)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive size-9"
                onClick={() =>
                  onChange(items.filter((_, itemIndex) => itemIndex !== index))
                }
                aria-label="Remove selected team member"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SingleItemEditor({
  item,
  onChange,
}: {
  item?: PageSectionItem;
  onChange: (item: PageSectionItem) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Full-stack mindset</Label>
        <p className="text-muted-foreground mt-1 text-xs">
          This area uses a single highlight. Edit its title and description.
        </p>
      </div>
      <div className="space-y-2 rounded-md border p-3">
        <Label>Title</Label>
        <Input
          value={item?.title ?? ""}
          onChange={(event) =>
            onChange({
              title: event.target.value,
              description: item?.description,
            })
          }
          placeholder="Full-stack mindset"
        />
        <Label>Description</Label>
        <textarea
          value={item?.description ?? ""}
          onChange={(event) =>
            onChange({ title: item?.title, description: event.target.value })
          }
          placeholder="Describe this highlight"
          rows={3}
          className="border-input focus-visible:ring-ring w-full border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>
    </div>
  );
}

function ContactFieldCopyEditor({
  title,
  labelValue,
  placeholderValue,
  onLabelChange,
  onPlaceholderChange,
}: {
  title: string;
  labelValue: string;
  placeholderValue: string;
  onLabelChange: (value: string) => void;
  onPlaceholderChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Field label</Label>
          <Input
            value={labelValue}
            onChange={(event) => onLabelChange(event.target.value)}
            placeholder="Field label"
          />
        </div>
        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            value={placeholderValue}
            onChange={(event) => onPlaceholderChange(event.target.value)}
            placeholder="Placeholder text"
          />
        </div>
      </div>
    </div>
  );
}

function ContactFormEditor({
  content,
  onChange,
}: {
  content?: ContactFormContent;
  onChange: (content: ContactFormContent) => void;
}) {
  const value = resolveContactFormContent(content);

  function update(patch: ContactFormContent) {
    onChange({ ...(content ?? {}), ...patch });
  }

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div>
        <Label>Contact form copy</Label>
        <p className="text-muted-foreground mt-1 text-xs">
          These labels, placeholders, options, and confirmation messages appear
          on the public contact form.
        </p>
      </div>

      <ContactFieldCopyEditor
        title="Name"
        labelValue={value.nameLabel}
        placeholderValue={value.namePlaceholder}
        onLabelChange={(nameLabel) => update({ nameLabel })}
        onPlaceholderChange={(namePlaceholder) => update({ namePlaceholder })}
      />
      <ContactFieldCopyEditor
        title="Email"
        labelValue={value.emailLabel}
        placeholderValue={value.emailPlaceholder}
        onLabelChange={(emailLabel) => update({ emailLabel })}
        onPlaceholderChange={(emailPlaceholder) =>
          update({ emailPlaceholder })
        }
      />
      <ContactFieldCopyEditor
        title="Company"
        labelValue={value.companyLabel}
        placeholderValue={value.companyPlaceholder}
        onLabelChange={(companyLabel) => update({ companyLabel })}
        onPlaceholderChange={(companyPlaceholder) =>
          update({ companyPlaceholder })
        }
      />
      <ContactFieldCopyEditor
        title="Project type"
        labelValue={value.projectTypeLabel}
        placeholderValue={value.projectTypePlaceholder}
        onLabelChange={(projectTypeLabel) => update({ projectTypeLabel })}
        onPlaceholderChange={(projectTypePlaceholder) =>
          update({ projectTypePlaceholder })
        }
      />
      <ContactFieldCopyEditor
        title="Estimated budget"
        labelValue={value.budgetLabel}
        placeholderValue={value.budgetPlaceholder}
        onLabelChange={(budgetLabel) => update({ budgetLabel })}
        onPlaceholderChange={(budgetPlaceholder) =>
          update({ budgetPlaceholder })
        }
      />
      <ContactFieldCopyEditor
        title="Project details"
        labelValue={value.detailsLabel}
        placeholderValue={value.detailsPlaceholder}
        onLabelChange={(detailsLabel) => update({ detailsLabel })}
        onPlaceholderChange={(detailsPlaceholder) =>
          update({ detailsPlaceholder })
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Project type options</Label>
          <Textarea
            value={value.projectTypeOptions.join("\n")}
            onChange={(event) =>
              update({
                projectTypeOptions: event.target.value.split(/\r?\n/),
              })
            }
            rows={7}
          />
          <p className="text-muted-foreground text-xs">One option per line.</p>
        </div>
        <div className="space-y-2">
          <Label>Budget options</Label>
          <Textarea
            value={value.budgetOptions.join("\n")}
            onChange={(event) =>
              update({ budgetOptions: event.target.value.split(/\r?\n/) })
            }
            rows={7}
          />
          <p className="text-muted-foreground text-xs">One option per line.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Submit button label</Label>
          <Input
            value={value.submitLabel}
            onChange={(event) => update({ submitLabel: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Send another button label</Label>
          <Input
            value={value.sendAnotherLabel}
            onChange={(event) =>
              update({ sendAnotherLabel: event.target.value })
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Success title</Label>
          <Input
            value={value.successTitle}
            onChange={(event) => update({ successTitle: event.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Success message</Label>
          <Textarea
            value={value.successMessage}
            onChange={(event) =>
              update({ successMessage: event.target.value })
            }
            rows={3}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <Label>Privacy note</Label>
          <Textarea
            value={value.privacyText}
            onChange={(event) => update({ privacyText: event.target.value })}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Privacy link label</Label>
          <Input
            value={value.privacyLinkLabel}
            onChange={(event) =>
              update({ privacyLinkLabel: event.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}

function SectionEditor({
  pageId,
  section,
  content,
  imageUrls,
  pendingImages,
  teamMembers,
  portfolioProjects,
  onContentChange,
  onSelectImage,
  onClearPendingImage,
  index,
}: {
  pageId: string;
  section: EditableSection;
  content: PageSectionContent;
  imageUrls: Record<string, string>;
  pendingImages: Record<string, File>;
  teamMembers: TeamMemberOption[];
  portfolioProjects: ProjectOption[];
  onContentChange: (content: PageSectionContent) => void;
  onSelectImage: (slot: string, file: File) => void;
  onClearPendingImage: (slot: string) => void;
  index: number;
}) {
  const [open, setOpen] = useState(index < 2);
  const fields = getSectionFields(section.kind);

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{section.label}</p>
            <span className="rounded-full border px-2 py-0.5 font-mono text-[11px]">
              {section.kind}
            </span>
            <span className="text-muted-foreground font-mono text-[11px]">
              {section.key}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Section {index + 1} of the page
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Collapse section" : "Expand section"}
        >
          {open ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
      </div>

      {open ? (
        <div className="space-y-5 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.eyebrow ? (
              <div className="space-y-2">
                <Label>Eyebrow</Label>
                <Input
                  value={content.eyebrow ?? ""}
                  onChange={(event) =>
                    onContentChange({ ...content, eyebrow: event.target.value })
                  }
                  placeholder="Small label above the title"
                />
              </div>
            ) : null}
            {fields.title ? (
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={content.title ?? ""}
                  onChange={(event) =>
                    onContentChange({ ...content, title: event.target.value })
                  }
                  placeholder="Section title"
                />
              </div>
            ) : null}
          </div>

          {fields.body ? (
            <div className="space-y-2">
              <Label>Body</Label>
              <RichTextEditor
                value={content.bodyHtml ?? ""}
                onChange={(bodyHtml) =>
                  onContentChange({ ...content, bodyHtml })
                }
                pageId={pageId}
                placeholder={`Write the ${section.label.toLowerCase()} content…`}
              />
            </div>
          ) : null}

          {fields.contactForm ? (
            <ContactFormEditor
              content={content.contactForm}
              onChange={(contactForm) =>
                onContentChange({ ...content, contactForm })
              }
            />
          ) : null}

          {fields.blogPostsPerPage ? (
            <BlogPostsSectionSettings
              value={content.postsPerPage}
              onChange={(postsPerPage) =>
                onContentChange({ ...content, postsPerPage })
              }
            />
          ) : null}

          {fields.cta || fields.secondaryCta ? (
            <div className="grid gap-4 md:grid-cols-2">
              {fields.cta ? (
                <>
                  <div className="space-y-2">
                    <Label>Button label</Label>
                    <Input
                      value={content.ctaLabel ?? ""}
                      onChange={(event) =>
                        onContentChange({
                          ...content,
                          ctaLabel: event.target.value,
                        })
                      }
                      placeholder="Optional button"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button URL</Label>
                    <Input
                      value={content.ctaHref ?? ""}
                      onChange={(event) =>
                        onContentChange({
                          ...content,
                          ctaHref: event.target.value,
                        })
                      }
                      placeholder="/contact"
                    />
                  </div>
                </>
              ) : null}
              {fields.secondaryCta ? (
                <>
                  <div className="space-y-2">
                    <Label>Secondary button label</Label>
                    <Input
                      value={content.secondaryCtaLabel ?? ""}
                      onChange={(event) =>
                        onContentChange({
                          ...content,
                          secondaryCtaLabel: event.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary button URL</Label>
                    <Input
                      value={content.secondaryCtaHref ?? ""}
                      onChange={(event) =>
                        onContentChange({
                          ...content,
                          secondaryCtaHref: event.target.value,
                        })
                      }
                      placeholder="/work"
                    />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {fields.items === "list" ? (
            <ItemsEditor
              items={content.items ?? []}
              onChange={(items) => onContentChange({ ...content, items })}
            />
          ) : null}

          {fields.items === "single" ? (
            <SingleItemEditor
              item={content.items?.[0]}
              onChange={(item) =>
                onContentChange({ ...content, items: [item] })
              }
            />
          ) : null}

          {fields.items === "team" ? (
            <TeamMembersEditor
              items={content.items ?? []}
              members={teamMembers}
              onChange={(items) => onContentChange({ ...content, items })}
            />
          ) : null}

          {fields.items === "projects" ? (
            <ProjectsPickerEditor
              items={content.items ?? []}
              projects={portfolioProjects}
              onChange={(items) => onContentChange({ ...content, items })}
            />
          ) : null}

          {fields.images && content.images && content.images.length > 0 ? (
            <div className="space-y-3">
              <Label>Section images</Label>
              <p className="text-muted-foreground text-xs">
                Images are registered in the database and uploaded to
                Uploadthing when you click Save.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {content.images.map((image) => (
                  <SectionImageUploader
                    key={image.slot}
                    image={image}
                    existingUrl={imageUrls[image.slot]}
                    pendingFile={pendingImages[image.slot]}
                    onSelectFile={(file) => onSelectImage(image.slot, file)}
                    onClearPending={() => onClearPendingImage(image.slot)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function PageEditor({
  page,
  imageUrls,
  teamMembers,
  portfolioProjects,
}: {
  page: EditablePage;
  imageUrls: Record<string, string>;
  teamMembers: TeamMemberOption[];
  portfolioProjects: ProjectOption[];
}) {
  const router = useRouter();
  const { startUpload } = useUploadThing("pageImage");
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [status, setStatus] = useState<PageStatus>(page.status);
  const [body, setBody] = useState(page.body ?? "");
  const bodyRef = useRef(page.body ?? "");
  const [sections, setSections] = useState<EditableSection[]>(() =>
    page.sections.map((section) => ({
      ...section,
      content: cloneContent(section.content),
    })),
  );
  const sectionsRef = useRef(sections);
  const [pendingImages, setPendingImages] = useState<
    Record<string, Record<string, File>>
  >({});
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const resolvedImageUrls = { ...imageUrls, ...uploadedUrls };
  const isDraft = status === "draft";

  function updateSectionContent(id: string, content: PageSectionContent) {
    setSections((current) => {
      const next = current.map((section) =>
        section.id === id ? { ...section, content } : section,
      );
      sectionsRef.current = next;
      return next;
    });
  }

  function setPendingImage(sectionId: string, slot: string, file: File | null) {
    setPendingImages((current) => {
      const sectionImages = { ...(current[sectionId] ?? {}) };
      if (file) {
        sectionImages[slot] = file;
      } else {
        delete sectionImages[slot];
      }

      const next = { ...current };
      if (Object.keys(sectionImages).length === 0) {
        delete next[sectionId];
      } else {
        next[sectionId] = sectionImages;
      }
      return next;
    });
  }

  async function saveAll() {
    if (saving) return;
    setSaving(true);

    try {
      await commitAllRichTextPendingUploads({ pageId: page.id });

      const pageRes = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          status,
          bodyHtml: page.isSystem ? undefined : bodyRef.current,
        }),
      });
      if (!pageRes.ok) {
        throw new Error(await readError(pageRes, "Could not save page"));
      }

      let uploadedCount = 0;
      const newUrls: Record<string, string> = {};

      for (const section of sections) {
        const files = pendingImages[section.id];
        if (!files) continue;

        for (const [slot, file] of Object.entries(files)) {
          const prepareRes = await fetch("/api/page-images/prepare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pageId: page.id,
              sectionKey: section.key,
              slot,
            }),
          });
          const prepared = (await prepareRes.json().catch(() => null)) as {
            imageId?: string;
            error?: string;
          } | null;
          if (!prepareRes.ok || !prepared?.imageId) {
            throw new Error(
              prepared?.error ?? "Could not register the image in the database",
            );
          }

          const uploaded = await startUpload([file], {
            imageId: prepared.imageId,
          });
          const url = uploaded?.[0]?.ufsUrl ?? uploaded?.[0]?.url;
          if (!url) throw new Error("Upload did not return a URL");

          newUrls[slot] = url;
          uploadedCount += 1;
        }
      }

      const sectionResults = await Promise.all(
        sectionsRef.current.map((section) => {
          const content =
            section.kind === "about-team"
              ? {
                  ...section.content,
                  items: (section.content.items ?? []).filter(
                    (item) => item.memberId,
                  ),
                }
              : section.kind === "home-projects" ||
                  section.kind === "work-projects"
                ? {
                    ...section.content,
                    items: (section.content.items ?? []).filter(
                      (item) => item.projectId,
                    ),
                  }
                : section.content;

          return fetch(`/api/pages/${page.id}/sections/${section.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          });
        }),
      );

      for (const result of sectionResults) {
        if (!result.ok) {
          throw new Error(
            await readError(result, "Could not save the page sections"),
          );
        }
      }

      setUploadedUrls((current) => ({ ...current, ...newUrls }));
      setPendingImages({});
      toast.success(
        uploadedCount > 0
          ? `Page saved and ${uploadedCount} image${uploadedCount === 1 ? "" : "s"} uploaded`
          : "Page saved",
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the page",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/dashboard/pages">
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to pages
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Edit {page.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {page.isSystem ? "Built-in page" : "Custom page"} ·{" "}
            <span className="font-mono">{page.path}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              href={isDraft ? `${page.path}?preview=1` : page.path}
              target="_blank"
              rel="noreferrer"
            >
              {isDraft ? (
                <Eye className="mr-1.5 size-3.5" />
              ) : (
                <ExternalLink className="mr-1.5 size-3.5" />
              )}
              {isDraft ? "Preview Page" : "View page"}
            </Link>
          </Button>
          <Button
            type="submit"
            form="page-edit-form"
            size="sm"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-3.5" />
            )}
            Save
          </Button>
        </div>
      </div>

      <form
        id="page-edit-form"
        onSubmit={(event) => {
          event.preventDefault();
          void saveAll();
        }}
        className="space-y-4 rounded-lg border p-4"
      >
        <div>
          <h2 className="font-medium">Page settings</h2>
          <p className="text-muted-foreground text-xs">
            {page.isSystem
              ? "The URL of a built-in page is fixed so navigation keeps working."
              : "Changing the URL updates the public path of this page."}{" "}
            Save applies page settings, section edits, and pending image
            uploads.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <select
              id="edit-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as PageStatus)}
              className="border-input focus-visible:ring-ring flex h-9 w-full border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="edit-slug">URL slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-sm">/</span>
              <Input
                id="edit-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                disabled={page.isSystem}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Public URL:{" "}
              <span className="font-mono">
                {page.isSystem ? page.path : `/${slug}`}
              </span>
            </p>
          </div>
        </div>

        {!page.isSystem ? (
          <div className="space-y-2">
            <Label>Page content</Label>
            <RichTextEditor
              value={body}
              onChange={(html) => {
                bodyRef.current = html;
                setBody(html);
              }}
              pageId={page.id}
              placeholder="Write the page content…"
            />
          </div>
        ) : null}
      </form>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Page sections</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Every section is stored in the database and rendered on the public
            page. Section edits and pending images are saved with the single
            Save button above.
          </p>
        </div>

        {sections.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border p-4 text-sm">
            This custom page uses the rich content above. Built-in pages include
            editable sections here.
          </p>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                pageId={page.id}
                section={section}
                content={section.content}
                imageUrls={resolvedImageUrls}
                pendingImages={pendingImages[section.id] ?? {}}
                teamMembers={teamMembers}
                portfolioProjects={portfolioProjects}
                onContentChange={(content) =>
                  updateSectionContent(section.id, content)
                }
                onSelectImage={(slot, file) =>
                  setPendingImage(section.id, slot, file)
                }
                onClearPendingImage={(slot) =>
                  setPendingImage(section.id, slot, null)
                }
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
