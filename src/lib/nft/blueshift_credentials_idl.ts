/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/blueshift_credentials.json`.
 */
export type BlueshiftCredentials = {
  address: "shftxrF75jt6u1nXCkkiarjwz4ENqm1tnummZZuBrDp";
  metadata: {
    name: "blueshiftCredentials";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "createUnit";
      discriminator: [0];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
          address: "admbF2RMVM2sW88XrFJhaSJBUFmEFetKJEdLZUqmPR5";
        },
        {
          name: "authority";
          writable: true;
          address: "B6guwZsuHqfwVeFXKbTed3Zez1ZvieQCtmqxsExSv4Y2";
        },
        {
          name: "unit";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [117, 110, 105, 116];
              },
              {
                kind: "arg";
                path: "name";
              },
            ];
          };
        },
        {
          name: "mplCoreProgram";
          address: "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "name";
          type: "string";
        },
        {
          name: "uri";
          type: "string";
        },
      ];
    },
    {
      name: "mintCredential";
      discriminator: [1];
      accounts: [
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "vault";
          writable: true;
          address: "9XVE3Wo7Gxhh1qoeeAgAQZ2y6DtPNqxcKUSncCeZANVL";
        },
        {
          name: "authority";
          writable: true;
          address: "B6guwZsuHqfwVeFXKbTed3Zez1ZvieQCtmqxsExSv4Y2";
        },
        {
          name: "unit";
          writable: true;
        },
        {
          name: "certification";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 101, 114, 116];
              },
              {
                kind: "account";
                path: "unit";
              },
              {
                kind: "account";
                path: "user";
              },
            ];
          };
        },
        {
          name: "mplCoreProgram";
          address: "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "signature";
          type: {
            array: ["u8", 64];
          };
        },
      ];
    },
    {
      name: "withdrawFees";
      discriminator: [2];
      accounts: [
        {
          name: "admin";
          writable: true;
          signer: true;
          address: "admbF2RMVM2sW88XrFJhaSJBUFmEFetKJEdLZUqmPR5";
        },
        {
          name: "vault";
          writable: true;
          address: "9XVE3Wo7Gxhh1qoeeAgAQZ2y6DtPNqxcKUSncCeZANVL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
  ];
};
