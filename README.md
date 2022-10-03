# zoho-automatic-attendance
With Selenium

Automate attendance with Zoho and GitHub Actions

```
# if you add new .env update workflow file and github secrets

ZOHO_EMAIL="<zoho-email>"
ZOHO_PASSWORD="<zoho-password>"

# execute as cli-args as EXECUTION_STATUS=<status> node index.js
EXECUTION_STATUS="check-out" or "check-in"

# slack hooks if any
SLACK_HOOK=""

ENCRYPTION_KEY=[<encryption-array>]
ENCRYPTION_IV=[<iv-array>]

# Usage: https://people.zoho.in/${process.env.ZOHO_LOCATION_URL}/zp#home/dashboard
ZOHO_LOCATION_URL=<zoho-namespace>
```

Slack Hook Render:

<img width="638" alt="image" src="https://user-images.githubusercontent.com/24915107/193522791-59fde953-6e74-4d5c-9bf8-c567d5ff74cc.png">
