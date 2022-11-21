import OTPAuth from 'otpauth'

export class Auth {
    constructor(client) {
        this.client = client;

        this.progress = 0;
        this.token = null;
        this.total = 3000;
    }

    decodeKey(encodedKey) {
        const buff = Buffer.from(encodedKey, 'base64').toString('utf-8');
        const [key, iv] = buff.split('-');
        const keyBuff = Buffer.from(key, 'hex');
        const ivBuff = Buffer.from(iv, 'hex');
        return {
            key: keyBuff,
            iv: ivBuff
        }
    }

    encodeKey(key, iv) {
        const keyBuff = Buffer.from(key).toString('hex');
        const ivBuff = Buffer.from(iv).toString('hex');
        const secret = Buffer.from(keyBuff + '-' + ivBuff).toString('base64');
        return secret;
    }

    stringify(data) {
        console.log(data);
        try {
            const otp = new OTPAuth.HOTP(data);
            console.log(otp.toString())
        } catch (err) {
            console.log('StringifiedOTPError', err);
        }
    }

    parseOTP(data) {
        try {
            const otp = new OTPAuth.URI.parse(data);
            return otp;
        } catch (err) {
            throw new Error('ParseOTPError: ' + err.message);
        }
    }

    generateOTPCode(data) {
        this.totp = new OTPAuth.TOTP(data);
        try {
            let progress;
            let period = this.totp.period;
            let total = this.total;

            // big ups https://codesandbox.io/s/counter-forked-6zjij?file=/src/components/TOTP.vue
            let tick = () => {
                progress = (total * (1 - (((0.001 * Date.now()) / period) % 1))) | 0;

                if (progress !== this.progress) {
                    this.token = this.totp.generate();
                    this.progress = progress;
                }
            }

            tick();
        } catch (err) {
            console.log('GenerateOTPCodeError', err);
        }

        return this;
    }
}