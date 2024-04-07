import {prisma} from './../lib/prisma'

async function seed(){
    await prisma.event.create({
        data: {
            id: '6ab897da-aa44-447b-9e7c-d2a90908481c',
            title: 'Example Event',
            details: 'This is an example event',
            maximumAttendees: 100,
            slug: 'example-event',
        }
    })
}

seed().then(() => {
    console.log('Seed complete')
})