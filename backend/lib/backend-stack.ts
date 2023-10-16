import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createCognitoWithGoogleAuth } from './auth/cognito'
import { authContext } from '../cdk.context'

export class BackendStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const CDKContext: authContext = this.node.tryGetContext('auth')
		const appName = 'app-with-google-auth'
		const auth = createCognitoWithGoogleAuth(this, {
			appName,
			google: CDKContext.google,
		})

		new cdk.CfnOutput(this, 'region', {
			value: this.region,
		})
		new cdk.CfnOutput(this, 'userPoolId', {
			value: auth.userPool.userPoolId,
		})
		new cdk.CfnOutput(this, 'userPoolWebClientId', {
			value: auth.userPoolClient.userPoolClientId,
		})
		new cdk.CfnOutput(this, 'identityPoolId', {
			value: auth.identityPool.identityPoolId,
		})
		new cdk.CfnOutput(this, 'UserPoolDomainUrl', {
			value: `${auth.userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
		})
		new cdk.CfnOutput(this, 'AuthorizedRedirectUserPoolDomainURL', {
			value: `https://${auth.userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com/oauth2/idpresponse`,
		})
	}
}
