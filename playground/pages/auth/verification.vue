<script setup>
import {useMounted} from "@vueuse/core";

definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
});
const router = useRouter();
const config = useRuntimeConfig();
const {$auth, $toast} = useNuxtApp();

const form = ref({});
const errors = ref([])
const submit = (value, {resetForm}) => {
  if(!form.value.code || form.value.code.length !== 8){
    errors.value.push({
      message: "not code"
    });
    return;
  }

  const code = JSON.parse(JSON.stringify(form.value.code));

  $auth._2fa('local', code)
      .then((response) => {
        router.push({path: '/sys'});
      })
      .catch((error) => {
        $toast.error('Invalid code. Please try again', {
          theme: 'colored',
        });
      });
};

const resendToken2fa = async () => {
  await $fetch('/api/resend-token-2fa', {
    baseURL: config.public.baseURL,
    method: 'POST',
    headers: $auth.headers,
  })
      .then(() => {
        $toast.success(
            'A verification code has been sent to your email. Please check your inbox and enter the code below.',
            {
              theme: 'colored',
            },
        );
      }).catch(() => {
    $toast.error(
        'An error occurred while trying to send the code. Please try again',
        {
          theme: 'colored',
        },
    );
  })
};

useAsyncData(() => {
  if(import.meta.client){
    resendToken2fa()
  }
})
</script>
<template>
  <div>
    <v-card flat>
      <v-card-title>Enter your code</v-card-title>
      <v-card-text
      >We've sent a verification code to your email. Please enter the code you
        received in the boxes below.
      </v-card-text>
      <div class="wrapper">
        <Form @submit="submit" class="theme__form">
          <div>
            <v-otp-input
                v-model="form.code"
                length="8"
                type="number"
                :error-messages="errors"
            />
          </div>
          <a
              class="flex justify-center mb-4 cursor-pointer"
              @click="resendToken2fa"
          >
            <span class="ml-4 text-[#ABABAB] text-[14px]"
            >I didn't receive the code</span
            >
          </a>
          <div class="flex items-center justify-end">
            <v-btn size="large" color="primary" type="submit">
              <span class="normal-case text-[14px]"> Enter </span>
            </v-btn>
          </div>
        </Form>
      </div>
      <v-card-actions>
        <div class="grid">
          <div>Access the page without authentication.&nbsp;<a href="/sys" class="text-primary">Enter</a></div>
          <v-btn size="large" color="secondary" variant="flat" to="/sys">
            <span class="normal-case text-[14px]"> Enter </span>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </div>
</template>
<style scoped>
:deep(.v-otp-input) {
  .v-otp-input__content {
    .v-field.v-field--focused {
      .v-field__outline {
        .v-field__outline__start,
        .v-field__outline__end {
          @apply border-[primary];
        }
      }
    }

    .v-field {
      background: white;

      .v-field__outline {
        .v-field__outline__start,
        .v-field__outline__end {
          @apply border-y border-[#e6e6e6] opacity-100;
        }

        .v-field__outline__start {
          @apply border-l;
        }

        .v-field__outline__end {
          @apply border-r;
        }
      }
    }

    .v-field:hover {
      .v-field__outline__start,
      .v-field__outline__end {
        @apply opacity-100;
      }
    }
  }
}
</style>
