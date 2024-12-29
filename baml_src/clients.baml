retry_policy RetryPolicy {
  max_retries 3
  strategy {
    type exponential_backoff
  }
}

client<llm> GPT4o {
  provider openai
  retry_policy RetryPolicy
  options {
    model "gpt-4o"
    api_key env.OPENAI_API_KEY
    temperature 0
  }
}

client<llm> GPT4oMini {
  provider openai
  retry_policy RetryPolicy
  options {
    model "gpt-4o-mini"
    api_key env.OPENAI_API_KEY
    // strategy [
    //   GPT4o
    // ]
  }
}

client<llm> GPT4oMini0Temperature {
  provider openai
  retry_policy RetryPolicy
  options {
    model "gpt-4o-mini"
    api_key env.OPENAI_API_KEY
    temperature 0
  }
}

client<llm> Claude {
  provider anthropic
  options {
    model "claude-3-5-sonnet-20240620"
    // model "claude-3-haiku-20240307"
    api_key env.ANTHROPIC_API_KEY
    allowed_role_metadata ["cache_control"]
    headers {
      "anthropic-beta" "prompt-caching-2024-07-31"
    }
  }
}

client<llm> FastAnthropic {
  provider anthropic
  options {
    model "claude-3-haiku-20240307"
    api_key env.ANTHROPIC_API_KEY
  }
}

client<llm> Fast {
  provider round-robin
  options {
    // This will alternate between the two clients
    strategy [FastAnthropic, GPT4oMini]
  }
}

client<llm> Openai {
  provider fallback
  options {
    // This will try the clients in order until one succeeds
    strategy [GPT4o, GPT4oMini]
  }
}