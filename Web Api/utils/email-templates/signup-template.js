const { model } = require("../../models/user");

const emailTemplate = (username) => {
    const emailText = ` <div class="bg-notify">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <p>Hello, welcome to fundstrtr
                    ${username} ,your to go crowdfunding application where you can invest in businesses at any stage.</p>

                    <p class="bg-light" style="background: E5E5E5; color: #283990">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum adipisci in, neque fuga repellat ex accusantium. Ipsam blanditiis, eaque, reprehenderit totam, architecto doloribus vel eveniet repellendus dignissimos placeat omnis voluptatum.
                    </p>
                </div>
            </div>
        </div>
    </div>`
    const emailHtml = `<h1>Welcome ${username}</h1> <br> ` + emailText
    return { emailHtml, emailText};
}

module.exports = emailTemplate;