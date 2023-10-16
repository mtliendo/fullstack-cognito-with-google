import {
	IdentityPool,
	UserPoolAuthenticationProvider,
} from '@aws-cdk/aws-cognito-identitypool-alpha'
import {
	AccountRecovery,
	ProviderAttribute,
	UserPool,
	UserPoolClient,
	UserPoolDomain,
	UserPoolIdentityProviderGoogle,
	VerificationEmailStyle,
} from 'aws-cdk-lib/aws-cognito'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'

type CognitoWithGoogleAuthProps = {
	appName: string
	google: {
		clientId: string
		clientSecretName: string
		callbackUrls: string[]
		logoutUrls: string[]
	}
}

export function createCognitoWithGoogleAuth(
	scope: Construct,
	props: CognitoWithGoogleAuthProps
) {
	const userPool = new UserPool(scope, `${props.appName}-userpool`, {
		userPoolName: `${props.appName}-userpool`,
		selfSignUpEnabled: true,
		accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
		userVerification: {
			emailStyle: VerificationEmailStyle.CODE,
		},
		autoVerify: {
			email: true,
		},
		standardAttributes: {
			email: {
				required: true,
				mutable: true,
			},
		},
	})

	const userPoolDomain = new UserPoolDomain(
		scope,
		`${props.appName}-userpooldomain`,
		{
			userPool,
			cognitoDomain: {
				domainPrefix: `${props.appName}`, // Specify a unique domain prefix
			},
		}
	)

	// when users sign up with google, they will be added to the userpool
	const googleSecretValue = Secret.fromSecretNameV2(
		scope,
		`${props.appName}-googleclientsecret`,
		props.google.clientSecretName
	)

	const googleProvider = new UserPoolIdentityProviderGoogle(
		scope,
		`${props.appName}-googleprovider`,
		{
			clientId: props.google.clientId,
			clientSecretValue: googleSecretValue.secretValue,
			scopes: ['openid', 'profile', 'email'],
			attributeMapping: {
				email: ProviderAttribute.GOOGLE_EMAIL,
				givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
				familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
				phoneNumber: ProviderAttribute.GOOGLE_PHONE_NUMBERS,
			},
			userPool,
		}
	)

	userPool.registerIdentityProvider(googleProvider)

	const userPoolClient = new UserPoolClient(
		scope,
		`${props.appName}-userpoolClient`,
		{
			userPool,
			oAuth: {
				flows: {
					authorizationCodeGrant: true,
				},
				callbackUrls: props.google.callbackUrls, // Replace with your actual callback URL
				logoutUrls: props.google.logoutUrls, // Replace with your actual logout URL
			},
		}
	)

	const identityPool = new IdentityPool(
		scope,
		`${props.appName}-identityPool`,
		{
			identityPoolName: `${props.appName}-identityPool`,
			allowUnauthenticatedIdentities: true,
			authenticationProviders: {
				userPools: [
					new UserPoolAuthenticationProvider({
						userPool: userPool,
						userPoolClient: userPoolClient,
					}),
				],
			},
		}
	)

	return { userPool, userPoolClient, identityPool, userPoolDomain }
}
