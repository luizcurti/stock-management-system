import { TokenPayload } from "../../src/models/requestsTypes";

declare global{
    namespace Express {
        interface Request {
            userData: TokenPayload
        }
    }
}