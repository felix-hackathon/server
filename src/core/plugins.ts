import hapiAuthJwt2 from "hapi-auth-jwt2";
import AppConfig from "./configs";
import hapiswagger from "hapi-swagger";
import hapiInert from "@hapi/inert";
import hapiVision from "@hapi/vision";
import laabr from "laabr";

const plugins: any[] = [];

plugins.push({
  plugin: hapiAuthJwt2,
  options: AppConfig.jwt,
});

if (AppConfig.documentation?.enable) {
  plugins.push({
    plugin: hapiswagger,
    options: {
      info: {
        title: AppConfig.documentation.options.info.title,
        version: AppConfig.documentation.options.info.version,
      },
      schemes: [AppConfig.documentation.schemes || "https"],
      grouping: "tags",
      securityDefinitions: {
        jwt: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
        },
      },
      security: [{ jwt: [] }],
    },
  });
  if (AppConfig.documentation.options.documentationPage) {
    plugins.push({
      plugin: hapiInert,
    });
    plugins.push({
      plugin: hapiVision,
      options: {},
    });
  }
}

plugins.push({
  plugin: laabr,
  options: {
    override: false,
    formats: {
      log: ":level - :message",
      response: ":method, :url, :status, :payload, (:responseTime ms)",
      "request-error":
        // eslint-disable-next-line max-len
        ":method, :url, :payload, :error[output.statusCode], :error, :error[stack]",
      onPostStart: ":level - :message",
      onPostStop: ":level - :message",
    },
    indent: 0,
    colored: true,
    hapiPino: {
      prettyPrint: AppConfig.env !== "production",
      mergeHapiLogData: true,
      ignoreFunc: (options: any, request: { path: string; method: string }) =>
        request.path.startsWith("/swagger") ||
        request.path.startsWith("/assets") ||
        request.path.includes("/favicon") ||
        request.path.includes("/upload/base64-image") ||
        request.path.includes("/upload/review/base64") ||
        request.method === "options",
      logPayload: true,
    },
  },
});

export default plugins;
