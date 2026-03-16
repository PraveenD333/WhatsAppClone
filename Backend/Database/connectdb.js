import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        const connection = await mongoose.connect(process.env.MONGODB)
        console.log(`MongoDB Connected Successfully...✅ ${connection.connection.host}`);
    } catch (error) {
        console.log("MongoDB Disconnected...❌");
        process.exit(1);
    }
}

export default connectDB; 