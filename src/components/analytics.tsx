"use client";

import Script from "next/script";

import { ConsentedScript } from "@/components/consent";

/**
 * Google Analytics and the Meta pixel, behind consent.
 *
 * Neither loads until two things are true: an id is configured, and the
 * visitor has allowed that category. Nothing is queued and no "denied by
 * default" flag is set, because ConsentedScript does not render its children
 * at all until the answer is yes. The tag is simply not on the page.
 *
 * To turn either on, set the id in Vercel. There is nothing else to do: the
 * consent panel and the cookie policy both read the same configuration and
 * start describing it the moment it is set.
 *
 *   NEXT_PUBLIC_GA_ID          G-XXXXXXXXXX     analytics
 *   NEXT_PUBLIC_META_PIXEL_ID  a numeric id     marketing
 *
 * They are NEXT_PUBLIC because both run in the browser. Neither is a secret;
 * anyone can read them out of any site using them.
 *
 * The pixel goes in "marketing" rather than "analytics" deliberately. It is
 * cross-site advertising tracking, which the ICO treats quite differently from
 * measurement, and lumping it in with analytics is how sites end up placing it
 * on people who only agreed to be counted.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function Analytics() {
  return (
    <>
      {GA_ID && (
        <ConsentedScript category="analytics">
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </ConsentedScript>
      )}

      {META_PIXEL_ID && (
        <ConsentedScript category="marketing">
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
          </Script>
        </ConsentedScript>
      )}
      {/*
        No <noscript> pixel. The usual one is a bare <img> that fires on load,
        which would report every visitor with JavaScript disabled regardless of
        what they chose, since there is no script there to check.
      */}
    </>
  );
}
