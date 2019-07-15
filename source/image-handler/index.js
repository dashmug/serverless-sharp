/*********************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://aws.amazon.com/asl/                                                                                    *
 *                                                                                                                    *
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

const ImageRequest = require('./image-request.js');
const ImageHandler = require('./image-handler.js');

exports.handler = async (event) => {
    const imageRequest = new ImageRequest();
    const imageHandler = new ImageHandler();
    try {
        const request = await imageRequest.setup(event);
        const processedRequest = await imageHandler.process(request);
        const response = {
            "statusCode": 200,
            "headers" : getResponseHeaders(processedRequest, null),
            "body": processedRequest.Body,
            "isBase64Encoded": true
        }
        return response;
    } catch (err) {
        console.log(err);
        const response = {
            "statusCode": err.status,
            "headers" : getResponseHeaders(null, true),
            "body": JSON.stringify(err),
            "isBase64Encoded": false
        }
        return response;
    }
}

/**
 * Generates the appropriate set of response headers based on a success
 * or error condition.
 * @param processedRequest
 * @param {boolean} isErr - has an error been thrown?
 */
const getResponseHeaders = (processedRequest, isErr) => {
    const corsEnabled = (process.env.CORS_ENABLED === "Yes");
    const headers = {
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": true,
        "Content-Type": "image"
    }
    if (corsEnabled) {
        headers["Access-Control-Allow-Origin"] = process.env.CORS_ORIGIN;
    }
    if (processedRequest && 'CacheControl' in processedRequest) {
        headers["Cache-Control"] = processedRequest.CacheControl;
    }
    if (isErr) {
        headers["Content-Type"] = "application/json"
    }
    return headers;
}