"use client";

import { Label } from "@/components/ui/label";

export default function Contact() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="text-muted-foreground mb-6">
        Get in touch with our team. We'd love to hear from you!
      </p>

      <div className="space-y-6">
        <div>
          <Label htmlFor="contact-email" className="text-sm font-medium">
            Email
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            support@buzzymuzzy.com
          </p>
        </div>

        <div>
          <Label htmlFor="contact-hours" className="text-sm font-medium">
            Hours
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Monday - Friday: 9:00 AM - 6:00 PM
          </p>
        </div>

        <div>
          <Label htmlFor="contact-response" className="text-sm font-medium">
            Response Time
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            We typically respond within 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
