// async function getToken(endpoints, value) {
//     try {
//         const data = await $fetch(endpoints.login.url, {
//             baseURL: siteUrl,
//             method: endpoints.login.method,
//             body: value,
//         });
//
//         const {token_type, expires_in, access_token, refresh_token} = data;
//         const token = token_type + " " + access_token;
//         const expires = expires_in + Date.now();
//
//         return {token, expires}
//
//
//     } catch (err) {
//         console.log(err)
//     }
// }