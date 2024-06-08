// Most Rails-like: job is class, call class method on it to schedule. This
// syntax is almost identical to ActiveJob in Rails
//
// When the job is executed, it is instantiated and the `perform` function is
// called
import ProductBackorderJob from 'src/jobs/ProductBackorderJob'

export const updateProduct = async (id, params) => {
  //
  // product update stuff...
  //

  if (product.inventory > 0) {
    ProductBackorderJob.performLater(product.id)
    // or with some options set for the job itself (wait 5 minutes to send)
    ProductBackorderJob.set({ wait: 300 }).performLater(product.id)
    // or send at a specific time in the future
    ProductBackorderJob.set({
      waitUntil: new Date(2024, 7, 1, 12, 0, 0),
    }).performLater(product.id)
  }

  return product
}

//
//
//
//
//

// Hybrid: job itself is still a class, but call a function to schedule the job,
// passing the class name and any arguments that the job needs to run
//
// Same as above, when the job is executed, it is instantiated and the `perform`
// function is called
import { performLater } from '@redwoodjs/jobs'

export const updateProduct = async (id, params) => {
  //
  // product update stuff...
  //

  if (product.inventory > 0) {
    performLater('ProductBackorderJob', product.id)
    // or maybe pass as many arguments as you want, but the last one is an optional options object for the job itself
    performLater('ProductBackorderJob', product.id, { wait: 300 })
    // or maybe args and options for the job are all passed in an object
    performLater('ProductBackorderJob', { args: [product.id], wait: 300 })
    // or this syntax if your arguments to the class are themselves objects
    performLater('ProductBackorderJob', { args: { id: product.id }, wait: 300 })
  }

  return product
}

//
//
//
//
//

// All prodceduarl: job itself is just a function, pass the name of it and any
// arguments that the job needs to run.
//
// There's a single file that exports all jobs directly, or imports and
// re-exports from individual files. Either way, you have a list of uniquely
// named functions for every possible job, and that name is what you pass to
// `performLater` along any arguments that were needed
//
// When the job is executed, the function is called directly
import { performLater } from '@redwoodjs/jobs'

export const updateProduct = async (id, params) => {
  //
  // product update stuff...
  //

  if (product.inventory > 0) {
    performLater('productBackorderJob', product.id)
    // or same args/options structure as above
    performLater('productBackorderJob', { args: product.id, wait: 300 })
  }

  return product
}

//
//
//
//
//

// This one sort of feels the same as using `db` or `logger`. This may require
// a build step in order to populate the `jobs` object with instances of all the
// available jobs, or else we require people to that themselves in the jobs.js
// file. See the second example in web/src/jobs/jobs.js for what this would
// look like.
import { jobs } from 'src/lib/jobs'

export const updateProduct = async (id, params) => {
  //
  // product update stuff...
  //

  if (product.inventory > 0) {
    jobs.productBackorder.performLater(product.id)
    // or same args/options structure as above
    jobs.productBackorder.set({ wait: 300 }).performLater(product.id)
  }

  return product
}
