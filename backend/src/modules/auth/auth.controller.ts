import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";
import { registerSchema } from "./auth.validation";
import { loginSchema } from "./auth.validation";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = registerSchema.parse(req.body);

    const user = await authService.register(data);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async(
 req:Request,
 res:Response,
 next:NextFunction
)=>{

 try{

 const data = loginSchema.parse(req.body);

 const result = await authService.login(data);


 res.status(200).json({
   success:true,
   message:"Login successful",
   data:result
 });


 }catch(error){
   next(error);
 }

};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};