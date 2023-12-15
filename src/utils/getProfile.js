// import {useFetch} from '@vueuse/core'
// export const getProfile = async (endpoints, token) => {
//     try {
//         const {data, pending, error, refresh} = await useFetch(endpoints.user.url, {
//             method: endpoints.user.method,
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': token
//             },
//         });
//
//         return data
//
//     } catch (err) {
//         console.log(err)
//     }
// }