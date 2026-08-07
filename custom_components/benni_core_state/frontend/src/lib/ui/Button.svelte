<svelte:options runes={true} />

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type ButtonVariant = "default" | "secondary" | "danger";

  interface Props extends HTMLButtonAttributes {
    variant?: ButtonVariant;
    children?: Snippet;
  }

  let {
    variant = "default",
    class: className = "",
    children,
    type = "button",
    ...rest
  }: Props = $props();
</script>

<button
  {...rest}
  {type}
  class={`button inline-flex min-h-11 items-center justify-center gap-2 ${variant === "default" ? "" : variant} ${className}`}
>
  {@render children?.()}
</button>
