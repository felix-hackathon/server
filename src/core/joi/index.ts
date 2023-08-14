import assert from "assert";
import JoiLib from "joi";
import JoiObjectId from "joi-objectid";
import JoiETHAddress from "joi-ethereum-address";

type JoiType = typeof JoiLib & {
  objectId: () => JoiLib.StringSchema;
  ethAddress: () => JoiLib.StringSchema;
  txHash: () => JoiLib.StringSchema;
};

const Joi: JoiType = {
  ...JoiLib,
  objectId: JoiObjectId(JoiLib),
  ethAddress: JoiETHAddress(JoiLib),
  txHash: () =>
    JoiLib.string()
      .alphanum()
      .min(64)
      .max(66)
      .regex(/^0x[a-fA-F0-9]{64}$/, "Tx hash")
      .error(new Error("must be a valid ethereum transaction hash")),
};

export default Joi;
