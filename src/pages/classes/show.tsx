import React from 'react'
import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { ClassDetails } from '@/types';
import { useShow } from '@refinedev/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { bannerPhoto } from '@/lib/cloudinary';
import { AdvancedImage } from '@cloudinary/react';

const Show = () => {
  const { query } = useShow<ClassDetails>({ resource: "classes" });
  
  const classDetails = query.data?.data;
  const { isLoading, isError } = query;

  if (isLoading || isError || !classDetails) {
    return (
      <ShowView className='class-view class-show'>
        <ShowViewHeader resource='classes' title='Class Details'/>

        <p className={`state-message ${isError ? 'is-error' : ''}`}>
          {isLoading ? 'Loading class details...' : isError ? 'Error loading class details.' : 'Class not found.'}
        </p>
      </ShowView>
  )};

  const teacherName = classDetails.teacher?.name ?? 'Unknown Teacher';
  const teachersInitials = 
    teacherName
      .split(' ').filter(Boolean).slice(0, 2)
      .map((part) => part[0]?.toUpperCase()).join('');

  const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(teachersInitials || 'NA')}`;

  const { 
    bannerCldPubId, 
    name, 
    description, 
    status, 
    capacity, 
    inviteCode, 
    subject, 
    teacher,
    department
  } = classDetails;
  
  return (
    <ShowView className='class-view class-show'>
      <ShowViewHeader resource='classes' title='Class Details'/>
      <div className="banner">
        {bannerCldPubId ? (
          <AdvancedImage cldImg={bannerPhoto(bannerCldPubId, name)} alt={name} />
        ) : (
          <div className='placeholder'></div>
        )}
      </div>

      <Card className='details-card'>
        <div className='details-header'>
          <div>
            <h1>{name}</h1>
            <p>{description}</p>
          </div>

          <div>
            <Badge variant="outline">{capacity} spots</Badge>
            <Badge variant="outline" data-status={status}>{status.toUpperCase()}</Badge>
          </div>
        </div>
        
        <div className='details-grid'>
          <div className='instructor'>
            <p>Instructor</p>
            <div>
              <img src={teacher?.name ? placeholderUrl : placeholderUrl} alt={teacherName} />

              <div>
                <p>{teacherName}</p>
                <p>{teacher?.email ?? 'No email available'}</p>
              </div>
            </div>
          </div>
          <div className='department'>
            <p>Department</p>
            <div>
              <p>{department?.name}</p>
              <p>{department?.description}</p>
            </div>
          </div>

        <Separator/>

          <div className='subject'>
            <p>Subject</p>
            <div>
              <Badge variant='outline'>Code: {subject?.code}</Badge>
              <p>{subject?.name}</p>
              <p>{subject?.description}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className='join'>
          <h2>How to Join</h2>
          <ol>
            <li>Click the "Join Class" button below</li>
            <li>Use invite code: <strong>{inviteCode}</strong></li>
            <li>Confirm your enrollment</li>
          </ol>
        </div>

        <Button size="lg" className='w-full'>Join Class</Button>
      </Card>
    </ShowView>
  )
}

export default Show