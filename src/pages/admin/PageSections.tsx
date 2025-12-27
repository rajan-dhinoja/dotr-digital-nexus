import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SectionManager } from "@/components/admin/SectionManager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";

const PAGE_TYPES = [
  { value: "home", label: "Homepage" },
  { value: "about", label: "About Page" },
  { value: "services", label: "Services Page" },
  { value: "portfolio", label: "Portfolio Page" },
  { value: "testimonials", label: "Testimonials Page" },
  { value: "contact", label: "Contact Page" },
  { value: "blog", label: "Blog Page" },
];

export default function AdminPageSections() {
  const [selectedPageType, setSelectedPageType] = useState<string>("home");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <LayoutGrid className="h-8 w-8" />
              Page Sections
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage dynamic sections for each page of your website
            </p>
          </div>
          
          <div className="w-full md:w-64">
            <Select value={selectedPageType} onValueChange={setSelectedPageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_TYPES.map((page) => (
                  <SelectItem key={page.value} value={page.value}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {PAGE_TYPES.find(p => p.value === selectedPageType)?.label} Sections
            </CardTitle>
            <CardDescription>
              Add, edit, reorder, and remove sections for this page. Changes are saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SectionManager pageType={selectedPageType} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
