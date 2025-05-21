import { NextResponse } from 'next/server';
import { getSuspectById, updateSuspect, deleteSuspect } from '@/services/suspect-service';
import { Suspect } from '@/types/suspect';

// GET /api/suspects/[id]
// Get a single suspect by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const suspect = await getSuspectById(params.id);
    
    if (!suspect) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(suspect);
  } catch (error) {
    console.error(`Error fetching suspect ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch suspect' },
      { status: 500 }
    );
  }
}

// PUT /api/suspects/[id]
// Update a suspect
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: Partial<Suspect> = await request.json();
    
    // Make sure we're not trying to update the ID
    if ('id' in body) {
      delete body.id;
    }
    
    const updatedSuspect = await updateSuspect(params.id, body);
    
    if (!updatedSuspect) {
      return NextResponse.json(
        { error: 'Failed to update suspect' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedSuspect);
  } catch (error) {
    console.error(`Error updating suspect ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update suspect' },
      { status: 500 }
    );
  }
}

// DELETE /api/suspects/[id]
// Delete a suspect
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteSuspect(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete suspect' },
        { status: 500 }
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting suspect ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete suspect' },
      { status: 500 }
    );
  }
}
