import 'dotenv/config';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    // profile has user info
    const email = profile.emails[0].value;
    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
        // If user doesn't exist, create a new one
        user = new User({ email, passwordHash: 'social-login' });
        await user.save();
    }
    return done(null, user);
}));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    // GitHub profile info
    const email = profile.emails && profile.emails[0].value;
    // Not all GitHub accounts have public email. If email is undefined, handle that case.
    const finalEmail = email || `${profile.username}@github-oauth.local`;

    let user = await User.findOne({ email: finalEmail });
    if (!user) {
        user = new User({ email: finalEmail, passwordHash: 'social-login' });
        await user.save();
    }
    return done(null, user);
}));

// These serialize/deserialize methods are not strictly needed if you're doing JWT issuing after callback,
// but required by passport for session handling. We'll just do minimal setup:
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id).then(u => done(null, u)).catch(done);
});

export default  passport;
