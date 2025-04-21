import Notification from "../model/notificationModel.js";

export default class NotificationController {
    async getNotification(req, res){
        try{
            let notification = await Notification.find({user:req.decoded.id}).populate('user', 'username email');
            res.status(200).json({msg: 'Notification fetched successfully', data: notification});
        }catch(err){
            console.error(err);
            res.status(500).json({msg:err});
        }
    }
}