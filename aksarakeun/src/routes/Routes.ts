import express from "express";

import UserController from "../controllers/UserController";
import UserValidation from "../middleware/validation/UserValidation";
import Authorization from "../middleware/Authorization";
import multer from 'multer';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });
router.post("/user/signup", UserValidation.RegisterValidation, UserController.Register);
router.post("/user/login", UserController.UserLogin);
router.get("/user/history", UserController.UserHistory);
router.post("/predict", [Authorization.Authenticated, upload.single('image')], UserController.Predict);
router.get("/user/refresh-token", UserController.RefreshToken);
router.get("/user/current-user", Authorization.Authenticated, UserController.UserDetail);
router.get("/user/logout", Authorization.Authenticated, UserController.UserLogout);
router.put("/user/:id", Authorization.Authenticated, UserController.UserUpdate);

export default router;