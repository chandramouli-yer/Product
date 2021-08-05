const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        min: 6,
        max: 255
    },
    EmailID: {
        type: String,
        require: true,
        unique:true
    },
    ProfilePic:{
        type:String,
        require:true

    },
    UserID:{
        type:String,
        require:true,
        unique: true
    },
    CreatedAt:{
        type:Date,
        require:true
    },
    UpdatedAt:{
        type:Date,
        require:true
    },
    IsBlocked:{
        type:Boolean,
        require:true,
        default:false
    },
    BlockedAt:{
        type:Date,
        require:true,
        default:null
    }
});

module.exports = mongoose.model('User', userSchema);
