import { app } from "./app";
const serverless = require('serverless-http');

module.exports.handler = serverless(app, {
  request (request: any = {}, event: any = {}, context: any = {}) {
    if (!request.context) {
      request.context = {};
    }
    request.context = event.requestContext;

    if (event.requestContext.authorizer) {
      request.claims = event.requestContext.authorizer.claims;
    } // include claims on request
  }
});