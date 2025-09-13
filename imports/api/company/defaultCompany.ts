import { CompanyCollection, COMPANY_ID, Company } from "./CompanyCollection";

export const createDefaultCompany = async () => {
  const company = await CompanyCollection.findOneAsync(COMPANY_ID);

  if (!company) {
    const defaultCompany: Company = {
      _id: COMPANY_ID,
      name: "Example Company Name",
      address: "123 Main Street, City, State 12345",
    };

    await CompanyCollection.insertAsync(defaultCompany);
    console.log("Created default company settings");
  }
};
