import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";

export default function VolunteersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 px-4 py-20">
        <div className="container mx-auto text-center">
          <h1 className="mb-6 text-4xl font-bold">
            Make a Difference: Volunteer With Us
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Join our compassionate team of volunteers and help provide care,
            love, and support to animals in need. Every moment you spend with us
            makes a real difference in their lives.
          </p>
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Volunteering Opportunities
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <OpportunityCard
              title="Animal Care"
              description="Help with feeding, grooming, and providing basic care for our shelter animals."
              commitment="4-6 hours/week"
            />
            <OpportunityCard
              title="Dog Walking"
              description="Take our dogs for walks, provide exercise, and help with basic training."
              commitment="2-4 hours/week"
            />
            <OpportunityCard
              title="Cat Socialization"
              description="Spend time with our cats, helping them stay social and comfortable with humans."
              commitment="2-4 hours/week"
            />
            <OpportunityCard
              title="Event Support"
              description="Help organize and run adoption events and fundraisers."
              commitment="As needed"
            />
            <OpportunityCard
              title="Administrative"
              description="Assist with paperwork, phone calls, and general office duties."
              commitment="4-6 hours/week"
            />
            <OpportunityCard
              title="Foster Care"
              description="Provide temporary homes for animals awaiting permanent adoption."
              commitment="Varies"
            />
          </div>
        </div>
      </section>

      {/* Sign Up Form */}
      <section className="bg-primary/5 px-4 py-16">
        <div className="container mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Volunteer Sign-Up
          </h2>
          <form className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <Input id="firstName" placeholder="Enter your first name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <Input id="lastName" placeholder="Enter your last name" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="interest" className="text-sm font-medium">
                Area of Interest
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="animal-care">Animal Care</SelectItem>
                  <SelectItem value="dog-walking">Dog Walking</SelectItem>
                  <SelectItem value="cat-socialization">
                    Cat Socialization
                  </SelectItem>
                  <SelectItem value="event-support">Event Support</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="foster-care">Foster Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="experience" className="text-sm font-medium">
                Previous Experience
              </label>
              <Textarea
                id="experience"
                placeholder="Tell us about any relevant experience you have"
                className="h-32"
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Volunteer Requirements
          </h2>
          <div className="prose max-w-none">
            <ul className="list-disc space-y-4 pl-6">
              <li>
                Must be 18 years or older (16+ with parent/guardian consent)
              </li>
              <li>Commit to at least 3 months of regular volunteering</li>
              <li>Complete our volunteer orientation and training program</li>
              <li>Be reliable and punctual for scheduled shifts</li>
              <li>Follow all shelter policies and procedures</li>
              <li>
                Have a genuine love for animals and commitment to their welfare
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function OpportunityCard({
  title,
  description,
  commitment,
}: {
  title: string;
  description: string;
  commitment: string;
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      <p className="mb-4 text-muted-foreground">{description}</p>
      <p className="text-sm">
        <span className="font-medium">Time Commitment:</span> {commitment}
      </p>
    </Card>
  );
}
