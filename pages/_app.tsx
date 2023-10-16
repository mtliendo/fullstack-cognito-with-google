import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '@aws-amplify/ui-react/styles.css'
import { Amplify } from 'aws-amplify'
const config = {
	aws_project_region: 'us-east-1',
	Auth: {
		region: 'us-east-1',
		userPoolId: 'us-east-1_nNRrlSc0z',
		userPoolWebClientId: '5f7fe9j1u9p711bk1odqkhfc2t',
		identityPoolId: 'us-east-1:1874e096-24d1-4134-97a1-20b6fbb7991b',
		oauth: {
			domain: 'app-with-google-auth.auth.us-east-1.amazoncognito.com',
			scope: [
				'phone',
				'email',
				'profile',
				'openid',
				'aws.cognito.signin.user.admin',
			],
			redirectSignIn: 'http://localhost:3000/',
			redirectSignOut: 'http://localhost:3000/',
			responseType: 'code',
		},
	},
}
Amplify.configure(config)
export default function App({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />
}
