const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export interface Address {
  id: number;
  label: string;
  street: string;
  city: string;
  region: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressInput {
  label: string;
  street: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

/*
 * GET ADDRESSES
 */
export const getAddresses = async (
  token: string,
): Promise<Address[]> => {

  const response = await fetch(
    `${API_URL}/addresses`,
    {
      method: "GET",

      cache: "no-store",

      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    },
  );


  const result =
    await response.json();


  console.log(
    "========== ADDRESS API ==========",
  );

  console.log(
    "HTTP STATUS:",
    response.status,
  );

  console.log(
    "FULL RESPONSE:",
    result,
  );

  console.log(
    "RESPONSE DATA:",
    result.data,
  );

  console.log(
    "IS ARRAY:",
    Array.isArray(result.data),
  );

  console.log(
    "ADDRESS COUNT:",
    Array.isArray(result.data)
      ? result.data.length
      : "NOT ARRAY",
  );

  console.log(
    "=================================",
  );


  if (!response.ok) {

    throw new Error(
      result.message ||
        "Failed to fetch addresses",
    );

  }


  if (!Array.isArray(result.data)) {

    throw new Error(
      "Invalid addresses response from server",
    );

  }


  return result.data;
};
/*
 * CREATE ADDRESS
 */

export const createAddress = async (
  token: string,
  data: CreateAddressInput,
): Promise<Address> => {
  const response = await fetch(
    `${API_URL}/addresses`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to create address",
    );
  }

  return result.data;
};