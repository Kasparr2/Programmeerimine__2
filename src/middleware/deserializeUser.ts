import {get} from "lodash";
import {Request, Response, NextFunction} from "express";
import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../service/session.service";



const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {

// get access tokens from headers.
const accessToken = get(req, "headers.authorization", "").replace(/^Bearer\s/, "");

const refreshToken = get(req, "headers.x-refresh");

// if no token return next
if(!accessToken){
    return next();
}

const {decoded, expired} = verifyJwt(accessToken);
//console.log("decoded", decoded);
//if decoded attach user to res.locals

if(decoded){
    res.locals.user = decoded;
    return next();
}

//if token is expired and there is a valid refreshToken attach new token
if(expired && refreshToken){
    const newAccessToken = await reIssueAccessToken({refreshToken});

    if(newAccessToken){
        res.setHeader('x-access-token', newAccessToken);
    }

    const result = verifyJwt(newAccessToken as string);

    res.locals.user = result.decoded;
    return next();
}

return next();

};
export default deserializeUser;