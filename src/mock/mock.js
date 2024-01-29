import { setupWorker, rest } from 'msw'

// 2. Describe network behavior with request handlers.
const worker = setupWorker(
    rest.post("https://*/v1/regions.json", (req, res, ctx) => {
        return res(
            ctx.json(require(`./data/regions_beta_web.json`))
        )
    }),
    rest.get("https://*/v1/routing.json", (req, res, ctx) => {
        if (req.url.searchParams.get("modes") === "me_car-s") {
            return res(
                ctx.json(require(`./data/routing-sgfleet.json`))
            )
        }
        return;
    }),
    rest.get("https://*/v1/locations.json", (req, res, ctx) => {
        if (req.url.searchParams.get("modes") === "me_car-s_sgfleet-sydney") {
            return res(
                ctx.json(require(`./data/locations-sgfleet.json`))
            )
        }
        return;
    }),
    rest.get("https://*/v1/locationInfo.json", (req, res, ctx) => {
        if (req.url.searchParams.get("identifier") === "sgfleet") {
            const start = req.url.searchParams.get("start")?.substring(0, 10);
            const end = req.url.searchParams.get("end")?.substring(0, 10);
            if (!start) {
                return res(
                    ctx.json(require(`./data/locationInfo-carPod-sgfleet.json`))
                )
            }
            try {
                return res(
                    ctx.json(require(`./data/locationInfo-carPod-sgfleet-${start}${(end && end !== start) ? "-" + end : ""}.json`))
                )
            } catch {
                // Mock json does not exist, so proceed with network request.
                return;
            }
        } else {
            return res(
                ctx.json(require(`./data/locationInfo.json`))
            )
        }
        return;
    })
);

// 3. Start request interception by starting the Service Worker.
// if (process.env.NODE_ENV === 'development') {
worker.start();
// }