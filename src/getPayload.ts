export const getPayload = (message: string, success: boolean) => ({
	blocks: [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: `You have a new request:\n*<https://people.zoho.in/peppercontentglobal/zp#home/dashboard|${
					success ? 'Successful' : 'Failed'
				}> ${message}*`,
			},
		},
		{
			type: 'actions',
			elements: [
				{
					type: 'button',
					text: {
						type: 'plain_text',
						emoji: true,
						text: 'Check-In Manually',
					},
					style: success ? 'primary' : 'danger',
					url: 'https://people.zoho.in/peppercontentglobal/zp#home/dashboard',
					action_id: 'button-action-0',
				},
				{
					type: 'button',
					text: {
						type: 'plain_text',
						emoji: true,
						text: 'Check-Out Manually',
					},
					style: success ? 'primary' : 'danger',
					url: 'https://people.zoho.in/peppercontentglobal/zp#home/dashboard',
					action_id: 'button-action-1',
				},
			],
		},
	],
})
