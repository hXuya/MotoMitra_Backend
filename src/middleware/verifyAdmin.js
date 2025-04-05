import jwt, { decode } from "jsonwebtoken";
import "dotenv/config";

export default (req, res, next) =>{
    try{
        // const token = req.cookies['token'];
        let token = req.headers['authorization'];
                // console.log(token);
                if(token && token.startsWith("Bearer")){
                    token = token.split(" ")[1];
                    let decoded = jwt.verify(token, process.env.JWT_SECRET);
            //sending decoded data. this can be accessed by decoded.id and decoded.email
            req.decoded = decoded;
            if(decoded.role === "admin"){
                next();
            }else{
                res.status(403).json({success:false, message:"Invalid token"});
            }
        }else{
            res.status(403).json({success:false, message:"Token not provided"});
        }
    }catch(err){
        console.log(err);
        res.status(403).json({success:false, message:"Invalid token Err"});
    }
}