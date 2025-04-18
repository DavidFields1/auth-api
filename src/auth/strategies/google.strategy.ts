/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-google-oauth20';
import { GoogleOAuthProfile } from '../interfaces/google-oauth-profile.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor() {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			scope: ['email', 'profile'],
			passReqToCallback: false,
		});
	}

	validate(
		accessToken: string,
		refreshToken: string,
		profile: GoogleOAuthProfile
	) {
		const { name, emails } = profile;

		const user = {
			email: emails[0].value,
			name: name.givenName,
			accessToken,
		};
		return user;
	}
}
