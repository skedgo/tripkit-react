exports.handler = (event, context, callback) => {
    let request = event.Records[0].cf.request;
    let headers = request.headers;
    if(headers.accept && headers.accept[0].value == "application/tripgo-share-url") {
        let host = headers.host && headers.host[0].value;
        let uri = request.uri;
        let requestUrl = 'https://' + host + uri + (request.querystring ? '?' + request.querystring : "");
        let shareUrl;
        if (uri.startsWith('/stop/') ||
            uri.startsWith('/service/')) {
            // The request url is already a share url, so return it (identity mapping).
            shareUrl = requestUrl;
        } else if (uri.startsWith('/trip/')) {
            const url = require('url');
            const queryData = url.parse(requestUrl, true).query;
            if (!queryData.server) {
                shareUrl = requestUrl;
            } else {
                shareUrl = 'https://' + queryData.server + '.buzzhives.com/satapp' + uri;
            }
        }
        let response;
        if (shareUrl !== undefined) {
            response = {
                status: '200',
                body: shareUrl
            };
        } else {
            response = {
                status: '404',
                body: 'No share url associated with web-app url'
            };
        }
        return callback(null, response);
    } else {
        // for all other requests proceed to origin
        callback(null, request);
    }
};