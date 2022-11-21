import OTPAuth from 'otpauth'


export class Auth {
    constructor(client) {
        this.client = client;
        this.qr = this.client.qr;
        this.progress = 0;
        this.token = null;
        this.timer = null;
        this.total = 3000;
    }

    async detectOTP(proxyURL, args) {
        if (proxyURL) {
            const qr = await this.client.qr.readImage(proxyURL);
            return qr;
        }
        const params = ['label', 'secret', 'issuer'];
        try {
            const validateOTP = this.parseOTP(args[0]);
            console.log(validateOTP);
            if (validateOTP) return validateOTP;
        } catch (err) {
            try {
                let otp = {};
                const query = args.join('').split('|');
                Array.from(query).map(str => {
                    let [key, value] = Array.from(str.split('='));
                    key = key.toLowerCase();
                    if (key && !params.includes(key)) {
                        throw new Error(key + ' is not a valid parameter.');
                    }

                    if (key && value && params.includes(key)) {
                        const i = params.indexOf(key);
                        params.splice(i, 1);
                        otp[key] = value;
                    }
                });
                Array.from(params).map(key => {
                    if (key === 'secret' || key === 'issuer') {
                        throw new Error(key + ' is a required parameter.');
                    } else if (key === 'label') {
                        otp['label'] = 'dreams-default'
                    }
                });
                const stringifiedOTP = this.stringifyOTP(otp);
                return this.parseOTP(stringifiedOTP);
            } catch (err) {
                return null;
            }
        }
    }

    stringifyOTP(otpData) {
        console.log('stringify data', otpData);
        const totp = new OTPAuth.TOTP({
            issuer: otpData.issuer,
            label: otpData.label,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: otpData.secret
        });
        console.log('stringified data', totp.toString());
        return totp.toString();
    }

    parseOTP(otpURL) {
        // console.log('parsing data', otpURL);
        const otp = new OTPAuth.URI.parse(otpURL);
        // console.log('parsed otp data', otp);
        return otp;
    }

    generateOTPCode(otpData) {
        this.totp = new OTPAuth.TOTP(otpData);
        try {
            let progress;
            let period = this.totp.period;
            let total = this.total;

            // big ups : https://codesandbox.io/s/counter-forked-6zjij?file=/src/components/TOTP.vue
            let tick = () => {
                progress = (total * (1 - (((0.001 * Date.now()) / period - 1) % 1))) | 0;
                if (progress !== this.progress) {
                    this.token = this.totp.generate();
                    this.progress = progress;
                }

                this.timer = tick;
            }

            tick();
        } catch (err) {
            throw new Error('OTPGenerateCodeError: ' + err.message);
        }

        return this;
    }
}