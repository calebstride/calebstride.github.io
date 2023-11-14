---
title: Designing
header: Designing
---

I decided to redo the "Manage Cabbage" website. The main reason was that I wanted to learn
some new technologies that I hadn't been given the chance to learn previously. This
would mainly include cloud technologies, such as Docker, Kubernetes and cloud platforms.

<div id="doc-menu-area" class="numbered-menu"> </div>

## Introduction

There were a couple of reasons I mentioned in
the [previous design section](previousDesign.html)
about what I would want to change about the website. With these points and wanting to
learn some new technologies I thought it would be a good idea to start the project again
from scratch. This page is all about the design of the new site and how it would be
created.

## Designing the application

I knew that I wanted to learn about cloud architecture, so I decided that the application
would focus around using Docker and Kubernetes to create and deploy microservices. So to
start, I needed to plan about what microservices I would need to run my website.

### Microservices

I started by planning out a rough idea of what I needed processing and what I'd need to
replace everything the current website does. Unlike my old website I decided to move out
some of the logic into separate services. This would make scalability easier to achieve
and would allow me to use existing microservices for of the server logic.

![Initial design of new system](/images/mcNew/new-design-one.png)

#### Application REST Service

The main microservice I would need would be one that handles all the logic of storing
and processing spending data given by users.

Initially I was thinking of having an individual microservice for each entity and
having them communicate via events. For
example, one microservice for transactions, and one for accounts. Then when a transaction
is
added an event is sent to the account service to tell it to add/remove the amount from the
given account. I decided against this as there wouldn't be that much logic surrounding
a lot of the data, e.g. categories. Also, a lot of the data is very tightly coupled, for
example, a category on its own contains no useful information. Only when it's grouped with
a transaction is where it's useful. So for simplicity I decided to keep it as one service.

To implement this service I was going to use Spring Boot to create a REST api. I already
had experience with Spring and Java so this seemed like the sensible option. Also, there
are lots of resources on using Spring Boot to create REST apis, so it should be
easier to learn how to do it.

#### Authentication Service

The old website did all the user management and authentication within the main codebase.
As I was trying to make this website a little easier to maintain I decided to move out all
this logic into a separate microservice.

Luckily for me there are already a few open source solutions that fulfill this
requirement.
For example, OpenAM, Keycloak and Apache Syncope to name a few. I decided to go with
Keycloak
as it had detailed documentation, as well as guides on how to get it working with cloud
architecture.

This would hopefully be pretty easy to set up and would require configuration rather than
having to code a new identity platform.

#### Databases

I would need two database containers in total to store data for the main REST service and
the authentication service. I decided to choose the same database for both as this would
reduce complexity of the tech stack.

I decided to go with PostgresSQL as I already had experience with it and I knew setting
up the docker image was relatively easy and simple to do. It's also open source and still
well maintained.

#### UI Delivery

I wasn't too sure on what would be a suitable solution to fulfill this service. The main
reason being that I knew I wanted to the UI to be separate from the backend.

After researching a bit I found that if the UI was written to be a static site that just
made requests to the backend. Then I could use a CDN or some sort of cloud object storage
to deliver the frontend. The issue with this approach though is that during development
I wouldn't really have the ability to do this locally.

For this reason I decided to just use a Nginx docker image to deliver the static web
files.
In the future when the whole of the app was in the cloud it should be possible to change
where the frontend is retrieved from.

As I knew that I wanted the UI to use static resources and not compiled by a
backend I decided to create it using React. This was also because I was interested in
how React worked and wanted to get some practice.

### Kubernetes

#### Ingress

As I was looking into which parts of my app should be publicly accessible I came across
the use of Ingress controllers. Instead of having to run multiple services for each public
part of my application I could run a single Ingress that would route the requests
depending
on the link to the appropriate service.

This seemed like a good idea as I would only need to configure the Ingress to decide which
parts of the microservices were accessible from the outside. One example is that Keycloak
came with admin endpoints that shouldn't be accessible to the public. So I could just
add a rule to the ingress that would make sure anybody requesting these endpoints
couldn't reach them. I could also
add [authentication](https://kubernetes.github.io/ingress-nginx/examples/auth/basic/)
to these endpoints.

#### Helm

As I was starting to mess around with Kubernetes I discovered a tool that I'll aim to make
use of. This tool is called [Helm](https://helm.sh/), which is a package manager for
kubernetes.

The idea being that you build your kubernetes resource files with templates, so that you
can swap out values in them between deployments. It also means that you don't need to
deploy a whole list of files, just the one helm project instead. By the look of it there
are already a lot of packages already available for common apps, such as database
deployments and proxy servers. So I could potentially make use of a few of these in the
future.

## Finished design

In the end my design looked like this:

![Finished design of new system](/images/mcNew/new-design-two.png)

I don't expect the finished application to stick to these designs exactly, but it's a good
starting point. It should also be relatively easy to add extra services later on. For 
example, I might want to add a Prometheus server with a Grafana frontend.

I also haven't added much design around the cloud platform I'll be hosting it in. This
is mainly because I want to keep my options open, but also because if it runs in 
Kubernetes then it should be deployable in most cloud platforms.