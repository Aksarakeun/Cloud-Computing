import { Request, Response } from "express";
import User from "../db/models/User";
import History from "../db/models/History";
import Helper from "../helper/Helper";
import PasswordHelper from "../helper/PasswordHelper";
import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const Register = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { name, email, password } = req.body;

        const hashed = await PasswordHelper.PasswordHashing(password);

        const user = await User.create({
            name,
            email,
            password: hashed,
            active: true,
            verified: true,
        });

        return res
            .status(201)
            .send(Helper.ResponseData(201, "Created", null, user));
    } catch (error: any) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const UserLogin = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            return res
                .status(401)
                .send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const matched = await PasswordHelper.PasswordCompare(
            password,
            user.password
        );
        if (!matched) {
            return res
                .status(401)
                .send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const dataUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            verified: user.verified,
            active: user.active,
        };
        const token = Helper.GenerateToken(dataUser);
        const refreshToken = Helper.GenerateRefreshToken(dataUser);

        const responseUser = {
            name: user.name,
            email: user.email,
            verified: user.verified,
            active: user.active,
            token: token,
            refresh_token: refreshToken,
        };
        return res
            .status(200)
            .send(Helper.ResponseData(200, "OK", null, responseUser));
    } catch (error) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const RefreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res
                .status(401)
                .send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const decodedUser = Helper.ExtractRefreshToken(refreshToken);
        console.log(decodedUser);
        if (!decodedUser) {
            return res
                .status(401)
                .send(Helper.ResponseData(401, "Unauthorized", null, null));
        }

        const token = Helper.GenerateToken({
            name: decodedUser.name,
            email: decodedUser.email,
            verified: decodedUser.verified,
            active: decodedUser.active,
        });

        const resultUser = {
            name: decodedUser.name,
            email: decodedUser.email,
            verified: decodedUser.verified,
            active: decodedUser.active,
            token: token,
        };

        return res
            .status(200)
            .send(Helper.ResponseData(200, "OK", null, resultUser));
    } catch (error) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const UserHistory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const authToken = req.headers["authorization"];
        const token = authToken && authToken.split(" ")[1];
        const decodedToken = Helper.ExtractToken(token!);

        const history = await History.findAll({
            where: { user_id: decodedToken!.id?.toString() },
        });

        return res
            .status(200)
            .send(Helper.ResponseData(200, "OK", null, history));
    } catch (error) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const UserDetail = async (req: Request, res: Response): Promise<Response> => {
    try {
        const email = res.locals.userEmail;
        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            return res
                .status(404)
                .send(Helper.ResponseData(404, "User not found", null, null));
        }

        const dataUser = {
            name: user.name,
            email: user.email,
            verified: user.verified,
            active: user.active,
        };

        const token = Helper.GenerateToken(dataUser);
        const refreshToken = Helper.GenerateRefreshToken(dataUser);

        const resultUser = {
            name: user.name,
            email: user.email,
            verified: user.verified,
            active: user.active,
            token: token,
            refresh_token: refreshToken,
        };
        return res
            .status(200)
            .send(Helper.ResponseData(200, "OK", null, resultUser));
    } catch (error) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const UserLogout = async (req: Request, res: Response): Promise<Response> => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res
                .status(200)
                .send(Helper.ResponseData(200, "User logout", null, null));
        }
        const email = res.locals.userEmail;
        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        if (!user) {
            res.clearCookie("refreshToken");
            return res
                .status(200)
                .send(Helper.ResponseData(200, "User logout", null, null));
        }

        await user.update({ accessToken: null }, { where: { email: email } });
        res.clearCookie("refreshToken");
        return res
            .status(200)
            .send(Helper.ResponseData(200, "User logout", null, null));
    } catch (error) {
        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const UserUpdate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { password, name, email } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res
                .status(404)
                .send(Helper.ResponseData(404, "User not Found", null, null));
        }

        if (password) {
            const hashedPassword = await PasswordHelper.PasswordHashing(
                password
            );
            user.password = hashedPassword;
        }

        if (name) {
            user.name = name;
        }

        if (email) {
            user.email = email;
        }

        await user.save();

        return res.status(200).send(Helper.ResponseData(200, "OK", null, null));
    } catch (error: any) {
        if (error != null && error instanceof Error) {
            return res
                .status(500)
                .send(Helper.ResponseData(500, "", error, null));
        }

        return res.status(500).send(Helper.ResponseData(500, "", error, null));
    }
};

const Predict = async (req: Request, res: Response): Promise<Response> => {
    const file = req.file;
    if (!file) {
        return res
            .status(400)
            .send(Helper.ResponseData(400, "File not received!", null, null));
    }
    const authToken = req.headers["authorization"];
    const token = authToken && authToken.split(" ")[1];
    const decodedToken = Helper.ExtractToken(token!);

    const forwardedUrl = `https://aksarakeunflask-qwjqhoyw4q-et.a.run.app/predict`; // Update with the actual server URL
    try {
        const formData = new FormData();
        formData.append("image", fs.createReadStream(file.path));

        const forwardedResponse = await axios.post(forwardedUrl, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        const { originalname, path: filePath } = file;
        const fileExtension = path.extname(originalname);
        const randomFilename = `${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}${fileExtension}`;
        const targetPath = path.join("images/", randomFilename);
        fs.renameSync(filePath, targetPath);
        const createHistory = async (
            user_id: number,
            imageFileName: string,
            result: string
        ): Promise<History> => {
            return History.create({
                user_id: user_id,
                image: imageFileName,
                result,
                createdAt: new Date(),
            });
        };
        createHistory(
            decodedToken?.id != null ? decodedToken.id : 0,
            randomFilename,
            forwardedResponse.data.result
        );
        return res
            .status(200)
            .send(
                Helper.ResponseData(
                    200,
                    "OK",
                    null,
                    forwardedResponse.data.result
                )
            );
    } catch (error) {
        return res
            .status(500)
            .send(Helper.ResponseData(500, "Server Error!", null, null));
    }
};

export default {
    Register,
    UserLogin,
    RefreshToken,
    UserDetail,
    UserLogout,
    UserUpdate,
    UserHistory,
    Predict,
};
