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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const db_1 = __importDefault(require("../../db/db"));
const zod_1 = require("../../zod");
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
//This Route is part of Step 2
//SIGNUP
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const success = zod_1.USER_BODY.safeParse(req.body);
    if (success.success) {
        try {
            const user = yield db_1.default.user.create({
                data: {
                    email: req.body.email,
                    username: req.body.username,
                    password: req.body.password,
                },
            });
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
            }, 
            //@ts-ignore
            process.env.USER_JWT_SECRET);
            return void res.status(200).json({
                token: token,
            });
        }
        catch (error) {
            return void res.status(500).json({ error: "Internal Server Error" });
        }
    }
}));
//This Route is also part of Step 2
//SIGNIN
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsedSignin = zod_1.SIGNIN_BODY.safeParse(req.body);
    if (!parsedSignin.success) {
        return void res.status(400).json({
            error: "Inputs format not correct should be handled in frontend itself",
        });
    }
    try {
        const user = yield db_1.default.user.findFirst({
            where: {
                email: parsedSignin.data.email,
            },
        });
        if (!user) {
            return void res.status(400).json({
                error: "You are not signedup yet",
            });
        }
        if (user.password === parsedSignin.data.password) {
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
            }, 
            //@ts-ignore
            process.env.USER_JWT_SECRET);
            return void res.status(200).json({
                token: token,
            });
        }
    }
    catch (error) {
        return void res.status(500).json({
            error: error,
        });
    }
}));
router.get("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('token', { httpOnly: true, secure: false, path: '/' });
    res.clearCookie('role', { httpOnly: true, secure: false, path: '/' });
    res.status(200).json({ message: 'Logged out successfully' });
}));
exports.default = router;
