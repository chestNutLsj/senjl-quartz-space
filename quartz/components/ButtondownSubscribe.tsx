import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/ButtondownSubscribe.scss"


export default (() => {
    function ButtondownSubscribe() {
        return <div class="buttondown-subscribe-box">
            <div class="subscribe-box-content">


                <form class="subscribe-form"
                    action="https://buttondown.com/api/emails/embed-subscribe/techandconsequence"
                    method="post"
                    target="popupwindow"
                    onSubmit="window.open('https://buttondown.com/techandconsequence', 'popupwindow')"
                    class="embeddable-buttondown-form"
                >
                    <input class="subscribe-email-input" type="email" name="email" id="bd-email" placeholder="Enter your email" />
                    <input class="subscribe-submit-button" type="submit" value="Subscribe" />
                </form>
            </div>
        </div>
    }

    ButtondownSubscribe.css = style
    return ButtondownSubscribe
}) satisfies QuartzComponentConstructor