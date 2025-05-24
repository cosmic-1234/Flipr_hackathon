"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization;
    if (!token) {
        return void res.status(400).json({
            error: "jwt not present",
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, //@ts-ignore
        process.env.JWT_SECRET);
        const user = yield db_1.default.user.findFirst({
            where: {
                id: decoded.userId,
            },
        });
        if (!user) {
            return void res.status(400).json({
                error: "This is a authenticated endpoint and you are not authorized to view this w/o signin/signup",
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return void res.status(400).json({
            message: "Json webtoken invalid",
        });
    }
});
exports.default = userAuth;
