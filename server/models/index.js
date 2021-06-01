import mongoose from 'mongoose';

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const connectDb = (host, user, pass) => {
  return mongoose.connect(`mongodb+srv://${user}:${pass}@${host}/gallery?retryWrites=true&w=majority`, {
    "auth": {
      "authSource": "admin"
    },
  });
};

export { connectDb };