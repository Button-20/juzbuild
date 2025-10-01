import { SUPPORTED_LANGUAGES } from "./countries";
import { FEATURES } from "./features";
import { base, heading } from "./fonts";
import { NAV_LINKS } from "./links";
import { PLANS } from "./plans";

export const isLive = process.env.NEXT_PUBLIC_IS_LIVE === "true";

export { base, FEATURES, heading, NAV_LINKS, PLANS, SUPPORTED_LANGUAGES };
