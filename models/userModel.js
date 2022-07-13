const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please tell us your name']
    },
    email:{
        type:String,
        required:[true, 'Please provide your email address'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail, 'Please provide a valid email address']
    },
    photo: String,
    password:{
        type:String,
        required:[true, 'A user must have a password'],
        minlength:[8, 'A password must be at least 8 characters'],
        select: false
    },
    passwordConfirm:{
        type:String,
        required:[true, 'Please confirm your password'],
        minlength:[8, 'A password confirmation must be at least 8 characters'],
        validate:{
            //This only works on CREATE and SAVE!!!!!
            validator:function(el){
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }
    }
});

userSchema.pre('save', async function (next) {
    //Only run this function if the password was actually modified
    if (!this.isModified('password')) return next();

    //Hash the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //Delete password confirmation
    this.passwordConfirm = undefined;
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

const User = mongoose.model('User',userSchema);

module.exports = User;