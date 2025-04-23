<script setup>
definePageMeta({
  layout: "auth",
});

const form = reactive({});
const hideField = ref(false);

const router = useRouter();
const route = useRoute();
const {$auth, $toast} = useNuxtApp();

const submit = (value, {resetForm, setErrors}) => {
  const data = {
    username: value.email,
    password: value.password,
  };

  $auth.loginWith("local", data)
      .catch((errors) => {
        if (errors.status === 422) {
          return;
        }
        $toast.error("Invalid login and/or password. Please try again", {
          theme: "colored",
        });
      });
};

useAsyncData(() => {
  if($auth.loggedIn){
    // router.push({path: "/auth/verification"});
    router.push({path: '/sys'});
  }
})
</script>
<template>
  <v-card flat>
    <v-card-title>Login</v-card-title>
    <Form @submit="submit" class="theme__form">
      <Field
          v-model="form.username"
          name="email"
          rules="required|email"
          as="div"
          v-slot="{ field, errors }"
      >
        <label>Email<sup>*</sup></label>
        <v-text-field
            placeholder="Email"
            density="compact"
            variant="outlined"
            color="primary"
            v-bind="field"
            :error-messages="errors[0]"
        />
      </Field>
      <Field
          v-model="form.password"
          name="password"
          rules="required|min:6"
          as="div"
          v-slot="{ field, errors }"
      >
        <label>Password<sup>*</sup></label>
        <v-text-field
            placeholder="Password"
            density="compact"
            variant="outlined"
            color="primary"
            :type="hideField ? 'text' : 'password'"
            :append-inner-icon="
            hideField ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
            @click:append-inner="hideField = !hideField"
            v-bind="field"
            :error-messages="errors[0]"
        />
      </Field>
      <div class="flex items-center justify-end">
        <v-btn size="large" color="primary" type="submit">
          <span class="normal-case text-[14px]"> Enter </span>
        </v-btn>
      </div>
    </Form>
    <v-card-actions>
      <div class="grid">
        <div>Access the page without authentication.&nbsp;<a href="/sys" class="text-primary">Enter</a></div>
        <v-btn size="large" color="secondary" variant="flat" to="/sys">
          <span class="normal-case text-[14px]"> Enter </span>
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>
<style scoped>

</style>
