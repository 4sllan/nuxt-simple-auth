export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.meta.layout !== 'front') return;

  const {$auth} = useNuxtApp();

  console.log($auth)


  $auth.headers.set("aslan", "sdsds")
  console.log($auth.headers)
  console.log($auth.headers.get("aslan"))
  console.log($auth.strategy)
  console.log($auth.prefix)

});
