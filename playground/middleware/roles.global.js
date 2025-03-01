export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.meta.layout !== 'front') return;

  const {$auth} = useNuxtApp();

  console.log($auth)


  $auth.headers.set("aslan", "sdsds")
  console.log($auth.headers)
  console.log($auth.strategy)

});
