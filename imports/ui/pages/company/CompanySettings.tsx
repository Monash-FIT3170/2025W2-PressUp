import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { CompanyCollection, Company } from "/imports/api";
import { Input, Label } from "../../components/interaction/Input";
import { TextArea } from "../../components/interaction/TextArea";
import { Button } from "../../components/interaction/Button";
import { Form } from "../../components/interaction/form/Form";
import { Loading } from "../../components/Loading";

export const CompanySettings = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Company Settings");
  }, [setPageTitle]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [companyLoaded, setCompanyLoaded] = useState(false);

  const isLoadingCompany = useSubscribe("company");
  const company: Company | undefined = useTracker(() => {
    return CompanyCollection.find().fetch()[0];
  });

  useEffect(() => {
    if (company && !companyLoaded) {
      setName(company.name || "");
      setAddress(company.address || "");
      setPhone(company.phone || "");
      setEmail(company.email || "");
      setWebsite(company.website || "");
      setCompanyLoaded(true);
    }
  }, [company, companyLoaded]);

  const validateEmail = (email: string) => {
    return !email || /^.+@.+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !address.trim()) {
      alert("Company name and address are required.");
      return;
    }

    if (email && !validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    Meteor.call(
      "company.update",
      {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
      },
      (error: Meteor.Error | undefined) => {
        if (error) {
          alert("Error updating company settings: " + error.reason);
        } else {
          alert("Company settings updated successfully!");
        }
      },
    );
  };

  if (isLoadingCompany()) {
    return (
      <div className="w-full p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="bg-stone-100 dark:bg-neutral-800 rounded-2xl shadow p-6">
        <Form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label>Company Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Press Up Cafe"
                required
              />
            </div>

            <div className="flex flex-col">
              <Label>Address *</Label>
              <TextArea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street, City, State 12345"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="flex flex-col">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <Label>Website</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.example.com"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" variant="positive">
                Save Settings
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};
