// import { Handler } from "@netlify/functions";

// const handler: Handler = async (event, context) => {
//   const path = "/.netlify/functions/proxy/";
//   const u = event.rawUrl;
//   const r = u.slice(u.indexOf(path) + path.length);
//   return {
//     statusCode: 200,
//     body: JSON.stringify({ url: r }),
//   };
// };

// export { handler };
import type { Context } from "netlify:edge";

export default async (req: Request, context: Context) => {
  console.log(context.geo);
  const path = "/proxy/";
  const u = req.url;
  const r = u.slice(u.indexOf(path) + path.length);
  console.log(r);

  return fetch(r, req);
};
